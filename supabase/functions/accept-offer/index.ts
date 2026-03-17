import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { decodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { offer_id, signature_data } = await req.json();

    if (!offer_id) {
      return new Response(JSON.stringify({ error: "offer_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!signature_data) {
      return new Response(JSON.stringify({ error: "signature_data is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch the offer with profile
    const { data: offer, error: offerError } = await serviceClient
      .from("b2b_offers")
      .select("*, b2b_profiles!inner(user_id, company_name, contact_first_name, contact_last_name)")
      .eq("id", offer_id)
      .single();

    if (offerError || !offer) {
      console.error("Offer not found:", offerError);
      return new Response(JSON.stringify({ error: "Offer not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the user owns this offer (via their b2b_profile)
    const profile = (offer as any).b2b_profiles;
    if (profile?.user_id !== user.id) {
      // Check if authorized person
      const { data: authPersonProfiles } = await serviceClient
        .rpc("get_authorized_profile_ids", { _user_id: user.id });
      
      const isAuthorized = authPersonProfiles?.includes(offer.b2b_profile_id);
      if (!isAuthorized) {
        return new Response(JSON.stringify({ error: "Access denied" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Check offer is in a confirmable state
    if (offer.status !== "sent") {
      return new Response(
        JSON.stringify({ error: `Offer cannot be accepted (current status: ${offer.status})` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Customer accepting offer:", offer.offer_number, "by user:", user.id);

    // Add signature to existing PDF
    let signedFileUrl = offer.file_url;
    let signedFileName = offer.file_name;

    if (offer.file_url) {
      try {
        // Extract storage path from the signed URL
        const urlObj = new URL(offer.file_url);
        const pathMatch = urlObj.pathname.match(/\/object\/sign\/([^?]+)/);
        let storagePath = "";
        if (pathMatch) {
          storagePath = decodeURIComponent(pathMatch[1]).replace(/^b2b-invoices\//, "");
        } else {
          // Try extracting from /object/public/ or /object/authenticated/
          const altMatch = urlObj.pathname.match(/\/object\/(?:public|authenticated)\/b2b-invoices\/(.+)/);
          if (altMatch) {
            storagePath = decodeURIComponent(altMatch[1]);
          }
        }

        if (storagePath) {
          // Download the existing PDF
          const { data: fileData, error: downloadError } = await serviceClient.storage
            .from("b2b-invoices")
            .download(storagePath);

          if (!downloadError && fileData) {
            const existingPdfBytes = await fileData.arrayBuffer();
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            
            // Add a new page with the signature
            const pages = pdfDoc.getPages();
            const lastPage = pages[pages.length - 1];
            const { width: pageWidth, height: pageHeight } = lastPage.getSize();
            
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            // Add signature section at the bottom of the last page or a new page
            const sigPageHeight = 250;
            let sigPage = lastPage;
            let sigY = 80; // Y position for signature on existing page

            // Check if there's enough space on the last page
            // If not, add a new page
            const freeSpace = sigY + sigPageHeight;
            if (freeSpace > pageHeight * 0.4) {
              // Add new page for signature
              sigPage = pdfDoc.addPage([pageWidth, pageHeight]);
              sigY = pageHeight - 120;
            }

            // Draw acceptance header
            const acceptDate = new Date().toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit", 
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            if (sigPage !== lastPage) {
              // On new page, draw header
              sigPage.drawText("Angebotsbestätigung", {
                x: 50,
                y: sigY + 40,
                size: 16,
                font: fontBold,
                color: rgb(0, 0.314, 0.49), // #00507d
              });
              sigPage.drawText(
                `Hiermit wird das Angebot ${offer.offer_number} verbindlich angenommen.`,
                { x: 50, y: sigY + 15, size: 10, font, color: rgb(0.3, 0.3, 0.3) }
              );
            }

            // Draw signature box
            const boxX = 50;
            const boxY = sigPage === lastPage ? sigY : sigY - 30;
            const boxWidth = 250;
            const boxHeight = 100;

            // Draw border
            sigPage.drawRectangle({
              x: boxX,
              y: boxY,
              width: boxWidth,
              height: boxHeight,
              borderColor: rgb(0.7, 0.7, 0.7),
              borderWidth: 0.5,
              color: rgb(1, 1, 1),
            });

            // Embed signature image
            if (signature_data.startsWith("data:image/png")) {
              const base64Data = signature_data.split(",")[1];
              const sigBytes = decodeBase64(base64Data);
              const sigImage = await pdfDoc.embedPng(sigBytes);
              const sigDims = sigImage.scale(1);
              
              // Scale to fit within box
              const maxW = boxWidth - 20;
              const maxH = boxHeight - 20;
              const scale = Math.min(maxW / sigDims.width, maxH / sigDims.height, 1);
              
              sigPage.drawImage(sigImage, {
                x: boxX + 10,
                y: boxY + 10,
                width: sigDims.width * scale,
                height: sigDims.height * scale,
              });
            }

            // Draw signature line and label
            sigPage.drawLine({
              start: { x: boxX, y: boxY },
              end: { x: boxX + boxWidth, y: boxY },
              thickness: 0.5,
              color: rgb(0.5, 0.5, 0.5),
            });

            const signerName = profile
              ? `${profile.contact_first_name} ${profile.contact_last_name}, ${profile.company_name}`
              : "Kunde";

            sigPage.drawText(signerName, {
              x: boxX,
              y: boxY - 14,
              size: 8,
              font,
              color: rgb(0.4, 0.4, 0.4),
            });

            sigPage.drawText(`Angenommen am ${acceptDate}`, {
              x: boxX,
              y: boxY - 26,
              size: 8,
              font,
              color: rgb(0.4, 0.4, 0.4),
            });

            // Add "ANGENOMMEN" watermark stamp on first page
            const firstPage = pages[0];
            firstPage.drawText("✓ ANGENOMMEN", {
              x: pageWidth - 220,
              y: pageHeight - 50,
              size: 14,
              font: fontBold,
              color: rgb(0, 0.5, 0),
            });

            // Save modified PDF
            const modifiedPdfBytes = await pdfDoc.save();

            // Upload signed PDF
            const signedPath = storagePath.replace(".pdf", "_signed.pdf");
            const { error: uploadError } = await serviceClient.storage
              .from("b2b-invoices")
              .upload(signedPath, modifiedPdfBytes, {
                contentType: "application/pdf",
                upsert: true,
              });

            if (!uploadError) {
              const { data: signedUrlData } = await serviceClient.storage
                .from("b2b-invoices")
                .createSignedUrl(signedPath, 60 * 60 * 24 * 365);

              signedFileUrl = signedUrlData?.signedUrl || offer.file_url;
              signedFileName = offer.file_name?.replace(".pdf", "_signed.pdf") || "signed_offer.pdf";
              console.log("Signed PDF uploaded:", signedPath);
            } else {
              console.error("Failed to upload signed PDF:", uploadError);
            }
          }
        }
      } catch (pdfError) {
        console.error("Error creating signed PDF:", pdfError);
        // Continue with acceptance even if PDF signing fails
      }
    }

    // Update offer status to accepted with signature
    const { error: updateOfferError } = await serviceClient
      .from("b2b_offers")
      .update({
        status: "accepted",
        customer_signature_data: signature_data,
        accepted_at: new Date().toISOString(),
        file_url: signedFileUrl,
        file_name: signedFileName,
      })
      .eq("id", offer_id);

    if (updateOfferError) {
      console.error("Failed to update offer:", updateOfferError);
      return new Response(JSON.stringify({ error: "Failed to accept offer" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update reservation status to confirmed (if linked)
    if (offer.reservation_id) {
      const { error: updateResError } = await serviceClient
        .from("b2b_reservations")
        .update({ status: "confirmed" })
        .eq("id", offer.reservation_id);

      if (updateResError) {
        console.error("Failed to update reservation:", updateResError);
      }
    }

    console.log("Offer accepted successfully:", offer.offer_number);

    return new Response(
      JSON.stringify({
        success: true,
        offer_number: offer.offer_number,
        reservation_updated: !!offer.reservation_id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
