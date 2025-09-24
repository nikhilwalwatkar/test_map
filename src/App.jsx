import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { gql, useQuery, useMutation, useSubscription } from "@apollo/client";
import Mapbox from "./Mapbox";
import NewMapBox from "./NewMapBox";
import TestMap from "./Testmap";

const USERS = gql`
  query {
    users {
      id
      name
      age
    }
  }
`;

function App() {
  // const { loading, data, refetch } = useQuery(USERS);
  // if (loading) return <p>Loading...</p>;
  return (
    <>
      <TestMap />
      {/* <div style={{ padding: "2rem" }}>
        <h6>Users (Vite + React + Apollo)</h6>
        <ul>
          {data.users.map((user) => (
            <li key={user.id}>
              {user.name} ({user.age})
            </li>
          ))}
        </ul>
      </div> */}
    </>
  );
}

export default App;
