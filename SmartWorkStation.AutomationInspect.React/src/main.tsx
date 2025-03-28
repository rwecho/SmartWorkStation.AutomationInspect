import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App, ConfigProvider } from "antd";
import { SizeType } from "antd/es/config-provider/SizeContext";
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./pages/home/index.tsx";
import DefaultLayout from "./components/layouts/DefaultLayout.tsx";
import CheckPage from "./pages/check/index.tsx";
import HistoryPage from "./pages/history/index.tsx";

const AppBuilder = () => {
  const [componentSize] = useState<SizeType>("middle");
  return (
    <>
      <ConfigProvider
        componentSize={componentSize}
        prefixCls="ant"
        iconPrefixCls="anticon"
        theme={{
          token: {},
          components: {
            Button: {},
          },
        }}
      >
        <App>
          <BrowserRouter>
            <Routes>
              <Route element={<DefaultLayout />}>
                <Route index element={<HomePage />} />
                <Route path="home" element={<HomePage />} />
                <Route path="check" element={<CheckPage />} />
                <Route path="history" element={<HistoryPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </App>
      </ConfigProvider>
    </>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <AppBuilder></AppBuilder>
  </StrictMode>
);
