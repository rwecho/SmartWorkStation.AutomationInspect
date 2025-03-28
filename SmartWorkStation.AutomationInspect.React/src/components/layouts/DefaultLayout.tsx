import { Layout, Menu, Button, theme } from "antd";
import Sider from "antd/es/layout/Sider";
import { Content } from "antd/es/layout/layout";
import { Outlet, useNavigate, useLocation } from "react-router";
import { useState } from "react";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
} from "@ant-design/icons";

const DefaultLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // 根据路径计算当前选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith("/home")) return "1";
    if (path.startsWith("/check")) return "2";
    if (path.startsWith("/history")) return "3";
    return "1"; // 默认选中工作台
  };

  const {
    token: { colorBgContainer },
  } = theme.useToken();
  return (
    <>
      <Layout>
        <Sider
          style={{
            background: colorBgContainer,
            minHeight: "100vh",
          }}
          className="h-full"
          trigger={null}
          collapsible
          collapsed={collapsed}
        >
          {!collapsed && (
            <div className="px-4 text-lg font-semibold py-6">
              <img src="/logo.png" alt="logo" className="w-full h-10" />
            </div>
          )}

          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={[
              {
                key: "1",
                icon: <AppstoreOutlined />,
                label: "工作台",
                onClick: () => {
                  navigate("/home");
                },
              },
              {
                key: "2",
                icon: <CheckCircleOutlined />,
                label: "校验",
                onClick: () => {
                  navigate("/check");
                },
              },
              {
                key: "3",
                icon: <HistoryOutlined />,
                label: "记录",
                onClick: () => {
                  navigate("/history");
                },
              },
            ]}
          />
          {collapsed && (
            <div className="flex absolute bottom-4 justify-center w-full">
              <Button
                type="text"
                className=""
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
              />
            </div>
          )}
          {!collapsed && (
            <Button
              type="text"
              className="absolute bottom-4 right-2"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
          )}
        </Sider>
        <Layout>
          <Content
            style={{
              background: colorBgContainer,
            }}
          >
            <Outlet></Outlet>
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default DefaultLayout;
