import { default as fauna } from "faunadb";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";

import { pipe } from "fp-ts/lib/function";
import { getEnv, getEnvOrDefault } from "./env.ts";

export const {
  Create,
  Collection,
  Paginate,
  Documents,
  Lambda,
  Get,
  Var,
  Select,
  Let,
  Match,
  Index,
  Join,
  If,
  Exists,
  Update,
  Do,
  Add,
  Subtract,
  Not,
  Contains,
  Abort,
  Now,
} = fauna.query;

export const q = fauna.query;
export type FaunaClient = fauna.Client;

export const getClient = (): O.Option<FaunaClient> =>
  pipe(
    O.Do,
    O.bind("secret", () => getEnv("FAUNA_SECRET")),
    O.map(
      ({ secret }) =>
        new fauna.Client({
          secret,
          domain: getEnvOrDefault("FAUNA_DOMAIN", () => "db.fauna.com"),
          port: 443,
          scheme: "https",
        })
    )
  );

export const decodeResult =
  <T>(codec: t.Type<T>) =>
  (result: any): E.Either<t.Errors, readonly T[]> => {
    const rows: { data: unknown }[] =
      result?.data instanceof Array ? result.data : [];
    return pipe(
      rows.map((r): E.Either<t.Errors, T> => codec.decode(r.data)), // why is decode not strictly typed??
      E.sequenceArray,
      E.map((e) => e)
    );
  };
