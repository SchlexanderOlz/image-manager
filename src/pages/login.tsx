import React, { useEffect, useState } from "react";
import { SHA256 as sha256 } from "crypto-js";
import * as email_validator from "email-validator";
import { signIn } from "next-auth/react";
import "@/app/globals.css";
import { useRouter } from "next/navigation";

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailInPutError, setEmailInputError] = useState(false);
  const [passwordInPutError, setPasswordInputError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    validate();
  }, [email, password]);

  async function handleSubmit(e: any) {
    e.preventDefault();
    console.log(email);
    console.log(password);
    let res = await signIn("credentials", {
      email,
      password,
      callbackUrl: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}`,
      redirect: false,
    });

    if (res?.ok) {
      router.push("/");
      return;
    }
    setError("Failed! Check you input and try again.");
    return res;
  }

  function validate() {
    let emailIsValid = email_validator.validate(email);

    if (!emailIsValid) {
      setEmailInputError(true);
      return;
    }
    if (password.length < 6) {
      setPasswordInputError(true);
      return;
    }
    setEmailInputError(false);
    setPasswordInputError(false);
  }
  return (
    <div className="flex justify-center items-center m-auto p-3 bg-base-100 h-screen">
      <h1 className="text-center text-4xl font-bold mb-4 mr-10">Image Manager</h1>
      <div className="divider divider-horizontal h-2/3 my-auto"></div>
      <form
        onSubmit={handleSubmit}
        className="bg-primary-100 shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-4">
          <label
            className="block text-primary-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              emailInPutError ? "border-red-500" : ""
            }`}
            id="email"
            type="text"
            placeholder="Email"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-primary-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${
              passwordInPutError ? "border-red-500" : ""
            }`}
            id="password"
            type="password"
            placeholder="******************"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <p className="text-red-500 text-xs italic">
            Please choose a password.
          </p>
        </div>
        <div className="flex items-center justify-between">
          <button
            className={`btn btn-secondary ${isLoading ? "loading" : ""}`}
            type="submit"
            disabled={isLoading ? true : false}
          >
            {isLoading ? "Loading..." : "Sign In"}
          </button>
          <a
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            href="#"
          >
            Forgot Password?
          </a>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
