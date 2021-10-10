import React from 'react'
import html from './index.html'

const Chart = () => {
  const template = { __html: html };
  return (
    <>
      <div dangerouslySetInnerHTML={template} />
    </>
  )
}

export default Chart
