import { Global } from "@emotion/react";
import IndexPage from "./pages/IndexPage/IndexPage";
import { reset } from "./style/theme";

function App() {
  return (
    <>
      <Global styles={reset} />
      <IndexPage />
    </>
  );
}

export default App;
