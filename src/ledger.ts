import {
  getClient,
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
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import * as t from "io-ts";

const LedgerCodec = t.type({
  id: t.string,
  name: t.string,
});

export type Ledger = t.TypeOf<typeof LedgerCodec>;

export const getLedgers = (): TE.TaskEither<unknown, readonly Ledger[]> =>
  pipe(
    getClient(),
    O.map(TE.right),
    O.getOrElse(() => TE.left("no client")),
    TE.chain((client) =>
      TE.tryCatch(
        () =>
          client.query(
            q.Map(
              Paginate(Documents(Collection("ledgers"))),
              Lambda("ref", Get(Var("ref")))
            )
          ),
        identity
      )
    ),
    TE.chainEitherKW(decodeResult(LedgerCodec))
  );

export const getLedgerById = (id: string): TE.TaskEither<unknown, Ledger> =>
  pipe(
    getClient(),
    O.map(TE.right),
    O.getOrElse(() => TE.left("no client")),
    TE.chain((client) =>
      TE.tryCatch(
        () =>
          client.query(
            q.Map(
              Paginate(Documents(Collection("ledgers"))),
              Lambda("ref", Get(Var("ref")))
            )
          ),
        identity
      )
    ),
    TE.chainEitherKW(decodeResult(LedgerCodec)),
    TE.chainEitherKW((ls) => {
      const result = ls.find((l) => l.id == id);
      return result === undefined ? E.left("not found") : E.right(result);
    })
  );
