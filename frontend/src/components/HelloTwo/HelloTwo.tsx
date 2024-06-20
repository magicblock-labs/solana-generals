import * as React from 'react';
import {
  useParams
} from "react-router-dom";

export function HelloTwo() {
  let params = useParams();
  return <h1 className="root">Hello again from React!! {Object.values(params).toString()}</h1>;
}
