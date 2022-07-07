/** @jsx h */
import { h } from "preact";
import { Handlers, PageProps } from "$fresh/server.ts";
import { pipe, identity } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";

import { Ledger, getLedgerById } from "../../src/ledger.ts";

type ViewModel = Ledger;

export const handler: Handlers<ViewModel> = {
  async GET(_, ctx) {
    const { id } = ctx.params;
    return await pipe(getLedgerById(id),
      TE.chainTaskK(d => async () => await ctx.render(d)),
      TE.mapLeft(e => new Response("Not found", {status: 404})), // TODO: distinguish between not found and error?
      TE.toUnion)();
  },
};

export default function Page({ data }: PageProps<ViewModel>) {
  return (
    <div>
      <h2>{data.name}</h2>
    </div>
  );
}