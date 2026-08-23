import asyncio, json, os, re
from pathlib import Path
from playwright.async_api import async_playwright

SHOTS = Path("/tmp/browser/smoke/screenshots"); SHOTS.mkdir(exist_ok=True)
BASE = "http://localhost:8080"
results = []

def rec(name, ok, detail=""):
    results.append((name, ok, detail))
    print(f"{'✅' if ok else '❌'} {name} | {detail}")

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width":1280,"height":1800})
        page = await ctx.new_page()
        cookies_json = os.environ.get("LOVABLE_BROWSER_SUPABASE_COOKIES_JSON")
        if cookies_json:
            cookies = json.loads(cookies_json)
            for c in cookies: c["url"] = BASE
            await ctx.add_cookies(cookies)

        mpp_hits = []
        page.on("request", lambda r: mpp_hits.append(r.url) if "managed_products_public" in r.url else None)

        # 1. Public product page
        await page.goto(f"{BASE}/mieten/krefeld/erdbewegung/minibagger-5t", wait_until="domcontentloaded")
        await page.wait_for_load_state("networkidle", timeout=20000)
        h1 = ((await page.locator("h1").first.text_content()) or "").strip()
        rec("1) Public product renders (H1 present, 'mieten in')", "mieten in" in h1.lower() and len(h1) > 5, f"h1={h1!r}")
        rec("2) managed_products_public request fired", len(mpp_hits) > 0, f"count={len(mpp_hits)}")

        # inject session for admin nav
        sk = os.environ["LOVABLE_BROWSER_SUPABASE_STORAGE_KEY"]
        sj = os.environ["LOVABLE_BROWSER_SUPABASE_SESSION_JSON"]
        await page.evaluate(f"window.localStorage.setItem({json.dumps(sk)}, {json.dumps(sj)})")

        # 3. B2B dashboard (admin gets redirected to /b2b/admin — expected)
        await page.goto(f"{BASE}/b2b/dashboard", wait_until="domcontentloaded")
        await page.wait_for_load_state("networkidle", timeout=15000)
        u = page.url
        rec("3) B2B dashboard reachable (admin redirect to /b2b/admin OK)",
            ("/b2b/dashboard" in u or "/b2b/admin" in u) and "login" not in u, f"url={u}")

        # 4. Firmendaten
        await page.goto(f"{BASE}/b2b/firmendaten", wait_until="domcontentloaded")
        await page.wait_for_load_state("networkidle", timeout=15000)
        rec("4) Firmendaten loads", "/b2b/firmendaten" in page.url and "login" not in page.url, f"url={page.url}")

        # 5. Admin Inventar — count rows
        await page.goto(f"{BASE}/b2b/admin?tab=inventory", wait_until="domcontentloaded")
        await page.wait_for_load_state("networkidle", timeout=20000)
        await page.wait_for_timeout(2500)
        # Take the largest tbody as the inventory table
        rows = await page.evaluate("""() => {
          const tbs = Array.from(document.querySelectorAll('table tbody'));
          return Math.max(0, ...tbs.map(tb => tb.querySelectorAll('tr').length));
        }""")
        await page.screenshot(path=str(SHOTS/"5_inventar.png"))
        rec("5) Admin inventar shows 369 rows", rows == 369, f"rows={rows}")

        # 6. SEO-Draft option shows (64) — open Status select first
        try:
            await page.locator("button[role=combobox]").last.click(timeout=5000)
            await page.wait_for_timeout(600)
        except Exception as e:
            print("select open failed:", e)
        body = await page.content()
        m = re.search(r"SEO-Entwurf vorhanden\s*\((\d+)\)", body)
        n = int(m.group(1)) if m else 0
        rec("6) SEO-Draft filter shows count=63", n == 63, f"match={m.group(0) if m else 'n/a'}")

        # 7. Registration form
        await page.goto(f"{BASE}/b2b/registrieren", wait_until="domcontentloaded")
        await page.wait_for_load_state("networkidle", timeout=15000)
        await page.screenshot(path=str(SHOTS/"7_register.png"))
        has_email = await page.locator('input[type="email"]').count() > 0
        has_form = await page.locator('form').count() > 0
        rec("7) Registration form renders", has_email and has_form, f"email={has_email} form={has_form}")

        await browser.close()

    passed = sum(1 for _,ok,_ in results if ok)
    print(f"\n=== {passed}/{len(results)} PASS ===")

asyncio.run(main())
