import * as queryString from "query-string";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { pipe, identity } from "fp-ts/lib/function";

export type GithubClient = {
  id: string;
  secret: string;
  redirectUri: string;
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
  html_url: t.string
});

export type GithubUser = t.TypeOf<typeof GithubUserCodec>;

const parseQueryString =
  <P>(codec: t.Type<P>) =>
  (x: string): E.Either<unknown, P> => {
    const parsed = queryString.parse(x);
    return pipe(
      parsed.error ? E.left(parsed) : E.right(parsed),
      E.chain(codec.decode)
    );
  };

export const getAccessToken =
  (client: GithubClient) =>
  (code: string): TE.TaskEither<unknown, GithubToken> => {
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
