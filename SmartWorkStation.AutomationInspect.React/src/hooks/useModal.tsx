import { Modal } from 'antd'
import React from 'react'
import { ReactNode, useState } from 'react'
import { createRoot } from 'react-dom/client'

export const ModalContext = React.createContext<{
  onOk?: (result: any) => void
  onCancel?: () => void
}>({
  onOk: undefined,
  onCancel: undefined,
})

const ModalProvider = ({
  children,
  onOk,
  onCancel,
}: {
  children: ReactNode
  onOk: (result: any) => void
  onCancel: () => void
}) => {
  return (
    <ModalContext.Provider value={{ onOk, onCancel }}>
      {children}
    </ModalContext.Provider>
  )
}

const CustomModal = ({
  title,
  footer,
  onClose,
  onOk,
  onCancel,
  children,
}: {
  title: string
  footer?: ReactNode
  onClose: () => void
  onOk: (result: any) => void
  onCancel: () => void
  children: ReactNode
}) => {
  const [open, setOpen] = useState(true)
  const handleOk = (result: any) => {
    setOpen(false)
    onOk(result)
  }

  const handleCancel = () => {
    setOpen(false)
    onCancel()
  }

  return (
    <ModalProvider onCancel={handleCancel} onOk={handleOk}>
      <Modal
        centered
        width={{
          xs: '90%',
          sm: '80%',
          md: '70%',
          lg: '60%',
          xl: '50%',
          xxl: '40%',
        }}
        title={title}
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        afterClose={onClose}
        destroyOnClose={true}
        footer={footer}
      >
        {children}
      </Modal>
    </ModalProvider>
  )
}

export const useModal = () => {
  const show = ({
    title,
    children,
    footer,
  }: {
    title: string
    children: ReactNode
    footer?: ReactNode
  }) => {
    return new Promise((resolve) => {
      const holder = document.createElement('div')
      holder.id = 'modal-root'
      const root = createRoot(holder)
      root.render(
        <CustomModal
          title={title}
          footer={footer}
          onClose={() => {
            document.body.removeChild(holder)
          }}
          onOk={(result) => {
            resolve(result)
          }}
          onCancel={() => {
            resolve(false)
          }}
        >
          {children}
        </CustomModal>
      )
      document.body.appendChild(holder)
    })
  }

  return [show]
}
