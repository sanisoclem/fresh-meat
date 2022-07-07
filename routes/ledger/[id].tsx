/** @jsx h */
import { h } from "preact";
import { Handlers, PageProps } from "$fresh/server.ts";
import { Ledger, getLedgerById } from "../../src/ledger.ts";

type ViewModel = Ledger;

export const handler: Handlers<ViewModel> = {
  async GET(_, ctx) {
    const { id } = ctx.params;
    const ledger = await getLedgerById(id);
    return ledger ? ctx.render(ledger) : new Response("Not found", {status: 404});
  },
};

export default function Page({ data }: PageProps<ViewModel>) {
  return (
    <div>
      <h2>{data.name}</h2>
    </div>
  );
}