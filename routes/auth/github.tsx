/** @jsx h */
import { h } from "preact";
import { Handlers, PageProps } from "$fresh/server.ts";
import * as queryString from "query-string";
import {
  getUserInfo,
  getAccessToken,
  GithubClient,
} from "../../utils/github.ts";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";

const getCode = (url: URL): E.Either<unknown, string> => {
  const code = url.searchParams.get("code");
  const err = url.searchParams.get("error");
  return !code || err ? E.left(err) : E.right(code);
};

const client: GithubClient = {
  id: "913b60c19151a18214c3",
  secret: "BLAH",
  redirectUri: "http://localhost:8000/auth/github",
};

export const handler: Handlers<unknown> = {
  async GET(req, _ctx) {
    const url = new URL(req.url);
    const redirect = await pipe(
      getCode(url),
      TE.fromEither,
      TE.chain(getAccessToken(client)),
      TE.chain((token) =>
        pipe(
          getUserInfo(token),
          TE.map((user) => [token, user] as const)
        )
      ),
      TE.map(([_token, _user]) => "http://localhost:8000/"),
      TE.mapLeft(e => `http://localhost:8000/login?${queryString.stringify({e:JSON.stringify(e)})}`),
      TE.toUnion
    )();

    return Response.redirect(redirect);
  },
};
