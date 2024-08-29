import { setPosts } from "@/components/redux/postSlice";
import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function useGetAllPost() {
    const dispatch = useDispatch()
  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/v1/post/all", {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setPosts(res.data.posts));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllPosts();
  }, []);
}
