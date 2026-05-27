import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// @testing-library/react 不再自动 cleanup,自己加
afterEach(() => cleanup())
