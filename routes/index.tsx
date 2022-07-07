/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import { Handlers, PageProps } from "$fresh/server.ts";
import { pipe, identity } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { getLedgers, Ledger } from "../src/ledger.ts";

type ViewModel = readonly Ledger[];
export const handler: Handlers<ViewModel> = {
  async GET(_, ctx) {
    return await pipe(getLedgers(),
      TE.chainTaskK(d => async () => await ctx.render(d)),
      TE.mapLeft(e => Response.error()),
      TE.toUnion)();
  },
};

export default function Dashboard({ data }: PageProps<ViewModel>) {
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
