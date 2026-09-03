import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import { ref } from 'vue';
import App from './App.vue';

const mockRoute = { path: '/' };
const mockPush = vi.fn();

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');
  return {
    ...actual,
    useRoute: () => mockRoute,
    useRouter: () => ({ push: mockPush }),
    RouterView: { render: () => null },
  };
});

describe('App theme toggle', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
  });

  function mountApp() {
    return mount(App, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          RouterView: true,
        },
      },
    });
  }

  it('defaults to light theme and sets data-theme on html', () => {
    const wrapper = mountApp();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(wrapper.find('button.theme-toggle').attributes('aria-label')).toBe('Switch to dark mode');
  });

  it('loads saved dark theme from localStorage on mount', async () => {
    localStorage.setItem('procurement-theme', 'dark');
    const wrapper = mountApp();
    await wrapper.vm.$nextTick();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(wrapper.find('button.theme-toggle').attributes('aria-label')).toBe('Switch to light mode');
  });

  it('toggles theme and persists to localStorage when clicked', async () => {
    const wrapper = mountApp();
    const button = wrapper.find('button.theme-toggle');

    await button.trigger('click');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('procurement-theme')).toBe('dark');
    expect(button.attributes('aria-label')).toBe('Switch to light mode');

    await button.trigger('click');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('procurement-theme')).toBe('light');
    expect(button.attributes('aria-label')).toBe('Switch to dark mode');
  });
});
