import { Layout, Menu, Button, theme } from 'antd'
import Sider from 'antd/es/layout/Sider'
import { Content } from 'antd/es/layout/layout'
import { Outlet, useNavigate } from 'react-router'
import { AppName } from '../../utils/AppConstants'
import { useState } from 'react'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'

const DefaultLayout = () => {
  const navigate = useNavigate()

  const [collapsed, setCollapsed] = useState(false)
  const {
    token: { colorBgContainer },
  } = theme.useToken()
  return (
    <>
      <Layout>
        <Sider
          style={{
            background: colorBgContainer,
            minHeight: '100vh',
          }}
          className='h-full'
          trigger={null}
          collapsible
          collapsed={collapsed}
        >
          {!collapsed && (
            <div className='p-4 text-lg font-semibold py-6'>{AppName}</div>
          )}

          <Menu
            theme='light'
            mode='inline'
            defaultSelectedKeys={['1']}
            items={[
              {
                key: '1',
                icon: <AppstoreOutlined />,
                label: '工作台',
                onClick: () => {
                  navigate('/home')
                },
              },
              {
                key: '2',
                icon: <CheckCircleOutlined />,
                label: '校验',
                onClick: () => {
                  navigate('/check')
                },
              },
            ]}
          />
          {collapsed && (
            <div className='flex absolute bottom-4 justify-center w-full'>
              <Button
                type='text'
                className=''
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
              />
            </div>
          )}
          {!collapsed && (
            <Button
              type='text'
              className='absolute bottom-4 right-2'
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
  )
}

export default DefaultLayout
