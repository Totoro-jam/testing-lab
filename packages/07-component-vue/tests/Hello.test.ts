import { render, screen } from '@testing-library/vue'
import Hello from '../src/Hello.vue'

describe('Hello.vue', () => {
  it('渲染传入的 name', () => {
    render(Hello, { props: { name: 'Alice' } })
    expect(screen.getByText('Hello, Alice')).toBeInTheDocument()
  })

  it('queryByText 用来验证"不存在"', () => {
    render(Hello, { props: { name: 'Alice' } })
    expect(screen.queryByText('Hello, Bob')).toBeNull()
  })
})
