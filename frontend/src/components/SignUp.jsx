import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);

  const [input, setInput] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
  });

  function changeEventHandler(e) {
    setInput({ ...input, [e.target.name]: e.target.value });
  }

  async function signupHandler(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/v1/user/register", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Account Created Successfully");
        setInput({
          username: "",
          fullName: "",
          email: "",
          password: "",
        });
      } else {
        throw new Error(data.message || "Something went Wrong");
      }
      return data;
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, []);

  return (
    <div className="flex items-center w-screen h-screen justify-center">
      <form
        onSubmit={signupHandler}
        className="shadow-lg flex flex-col gap-5 p-8"
      >
        <div className="my-4">
          <h1 className="text-center font-bold text-xl">LOGO</h1>
          <p className="text-sm text-center">
            Signup to see photos & videos from your friends
          </p>
        </div>
        <div>
          <span className="font-medium">full Name</span>
          <Input
            type="text"
            name="fullName"
            value={input.fullName}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>
        <div>
          <span className="font-medium">Username</span>
          <Input
            type="text"
            name="username"
            value={input.username}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>
        <div>
          <span className="font-medium">Email</span>
          <Input
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>
        <div>
          <span className="font-medium">Password</span>
          <Input
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>
        {loading ? (
          <Button>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button type="submit">Signup</Button>
        )}
        <span className="text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600">
            Login
          </Link>
        </span>
      </form>
    </div>
  );
}
