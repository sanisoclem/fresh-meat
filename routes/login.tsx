/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import * as queryString from "query-string";


export default function Home() {
  const params = queryString.stringify({
    client_id: '913b60c19151a18214c3',
    redirect_uri: 'http://localhost:8000/auth/github',
    scope: ['read:user', 'user:email'].join(' '), // space seperated string
    allow_signup: true,
  });
  const loginUrl = `https://github.com/login/oauth/authorize?${params}`;
  return (
    <div class={tw`bg-gray-800 w-screen text-white`}>
      <div class={tw`mx-auto p-4 min-h-screen gap-y-8 max-w-md flex flex-col justify-center items-center`}>
        <a href={loginUrl}>Login with Github</a>
      </div>
    </div>
  );
}
