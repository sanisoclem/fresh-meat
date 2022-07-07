/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import { Handlers, PageProps } from "$fresh/server.ts";
import { getLedgers, Ledger } from "../src/ledger.ts";

export const handler: Handlers<Ledger[]> = {
  async GET(_, ctx) {
    const ledgers = await getLedgers();
    return ctx.render(ledgers);
  },
};


export default function Dashboard({ data }: PageProps<Ledger[]>) {
  return (
    <div class={tw`bg-gray-800 w-screen text-white`}>
      <div class={tw`mx-auto p-4 min-h-screen gap-y-8 max-w-md flex flex-col justify-center items-center`}>
        <h2>Ledgers</h2>
        <ul>
          {data.map(l => <li><a href={`/ledger/${l.id}`}>{l.name}</a></li>)}
        </ul>
      </div>
    </div>
  );
}
