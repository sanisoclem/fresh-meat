/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";


export default function Home() {
  return (
    <div class={tw`bg-gray-800 w-screen text-white`}>
      <div class={tw`mx-auto p-4 min-h-screen gap-y-8 max-w-md flex flex-col justify-center items-center`}>
        <a href="/login">Login</a>
      </div>
    </div>
  );
}
