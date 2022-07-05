/** @jsx h */
import { h } from "preact";
import { Handlers, PageProps } from "$fresh/server.ts";
import * as queryString from 'query-string';
import { getAccessToken } from '../../utils/github.ts';

export const handler: Handlers<unknown> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    if (!code || url.searchParams.get('error'))
      return Response.redirect("/login");

    const params = queryString.stringify({
      client_id: '913b60c19151a18214c3',
      client_secret: 'SECRET',
      redirect_uri: 'http://localhost:8000/auth/github',
      code,
    });
    // TODO: get access token
    const resp = await fetch(`https://github.com/login/oauth/access_token?${params}`);
    const body = await resp.text();
    console.log(body);
    const parsed = queryString.parse(body);

    const userResp = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${parsed.access_token}`
      }
    });

    return await ctx.render(await userResp.text());
  },
};

export default function Page({ data }: PageProps<unknown>) {
  return (
    <pre>
      {JSON.stringify(data)}
    </pre>
  );
}