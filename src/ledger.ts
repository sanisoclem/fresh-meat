import {
  FaunaClient,
  decodeResult,
  q,
  Paginate,
  Documents,
  Collection,
  Lambda,
  Get,
  Var,
} from "./fauna.ts";

import { pipe, identity } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import * as t from "io-ts";

const LedgerCodec = t.type({
  id: t.string,
  name: t.string,
});

export type Ledger = t.TypeOf<typeof LedgerCodec>;

export const getLedgers = (dbClient: FaunaClient): TE.TaskEither<unknown, readonly Ledger[]> =>
  pipe(
    TE.tryCatch(
      () =>
      dbClient.query(
          q.Map(
            Paginate(Documents(Collection("ledgers"))),
            Lambda("ref", Get(Var("ref")))
          )
        ),
      identity
    ),
    TE.chainEitherKW(decodeResult(LedgerCodec))
  );

export const getLedgerById = (dbClient: FaunaClient, id: string): TE.TaskEither<unknown, Ledger> =>
  pipe(
    TE.tryCatch(
      () =>
      dbClient.query(
          q.Map(
            Paginate(Documents(Collection("ledgers"))),
            Lambda("ref", Get(Var("ref")))
          )
        ),
      identity
    ),
    TE.chainEitherKW(decodeResult(LedgerCodec)),
    TE.chainEitherKW((ls) => {
      const result = ls.find((l) => l.id == id);
      return result === undefined ? E.left("not found") : E.right(result);
    })
  );
