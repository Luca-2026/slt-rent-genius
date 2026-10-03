/** Designated test-customer mail must never notify operational mailboxes. */
export function documentEmailRecipients(recipient: string, copies: string[] = []) {
  const address = recipient.trim();
  return {
    to: [address],
    cc: address.toLowerCase() === "luca@sandhoff.org"
      ? []
      : Array.from(new Set(copies.filter((copy) => copy && copy !== address))),
  };
}

export function operationalEmailRecipient(customerEmail: string | undefined, mailbox: string): string {
  return customerEmail?.trim().toLowerCase() === "luca@sandhoff.org"
    ? "luca@sandhoff.org"
    : mailbox;
}