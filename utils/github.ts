import * as queryString from "query-string";
import * as TE from "fp-ts/lib/TaskEither";
import * as O from "fp-ts/lib/Option";
import * as t from "io-ts";
import { pipe, identity } from "fp-ts/lib/function";
import { parseQueryString, getEnv } from "./env.ts";
import { sequenceT } from "fp-ts/Apply";

export type GithubClient = {
  id: string;
  secret: string;
  redirectUri: string;
  redirectError: string;
  redirectSuccess: string;
};

const GithubTokenCodec = t.type({
  access_token: t.string,
  token_type: t.string,
  scope: t.string,
});

export type GithubToken = t.TypeOf<typeof GithubTokenCodec>;

const GithubUserCodec = t.type({
  login: t.string,
  id: t.number,
  name: t.string,
  url: t.string,
  html_url: t.string,
});

export type GithubUser = t.TypeOf<typeof GithubUserCodec>;

export const getClient = (): O.Option<GithubClient> =>
  pipe(
    sequenceT(O.Apply)(
      getEnv("GITHUB_CLIENT_ID"),
      getEnv("GITHUB_CLIENT_SECRET"),
      getEnv("GITHUB_CLIENT_REDIRECT_URI"),
      getEnv("GITHUB_CLIENT_REDIRECT_URI_ERROR"),
      getEnv("GITHUB_CLIENT_REDIRECT_URI_SUCESS")
    ),
    O.map(([id, secret, redirectUri, redirectError, redirectSuccess]: string[]) => ({
      id,
      secret,
      redirectUri,
      redirectError,
      redirectSuccess
    }))
  );

export const getAccessToken = (
  client: GithubClient,
  code: string
): TE.TaskEither<unknown, GithubToken> => {
  const params = queryString.stringify({
    client_id: client.id,
    client_secret: client.secret,
    redirect_uri: client.redirectUri,
    code,
  });
  return pipe(
    TE.tryCatch(
      () => fetch(`https://github.com/login/oauth/access_token?${params}`),
      identity
    ),
    TE.chainTaskK((resp) => () => resp.text()),
    TE.chainEitherK(parseQueryString(GithubTokenCodec))
  );
};

export const getUserInfo = (
  token: GithubToken
): TE.TaskEither<unknown, GithubUser> =>
  pipe(
    TE.tryCatch(
      () =>
        fetch("https://api.github.com/user", {
          headers: {
            Authorization: `token ${token.access_token}`,
          },
        }),
      identity
    ),
    TE.chainTaskK((resp) => () => resp.json()),
    TE.chainEitherK(GithubUserCodec.decode)
  );
