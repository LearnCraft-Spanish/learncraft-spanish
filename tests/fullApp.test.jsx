import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import App from '../src/App.jsx';
import Menu from '../src/Menu.jsx';
import SimpleQuizApp from '../src/SimpleQuizApp.jsx';
import AudioQuiz from '../src/AudioQuiz.jsx';
import LoginButton from '../src/LoginButton.jsx';
import LogoutButton from '../src/LogoutButton.jsx';

// Mock the Auth0 hook
vi.mock('@auth0/auth0-react');
const mockAuth0 = useAuth0;

describe('App component', () => {
  beforeEach(() => {
    mockAuth0.mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false,
      loginWithRedirect: vi.fn(),
      logout: vi.fn(),
      getAccessTokenSilently: vi.fn(),
    });
  });

  test('renders without crashing', () => {
    render(<Router><App /></Router>);
    expect(screen.getByText(/You must be logged in to use this app/i)).toBeInTheDocument();
  });

  test('renders Menu component correctly', () => {
    render(<Router><Menu userData={{}} /></Router>);
    expect(screen.getByText(/Welcome back!/i)).toBeInTheDocument();
  });

  test('renders SimpleQuizApp component correctly', () => {
    render(<Router><SimpleQuizApp studentID={1} studentName="Test Student" examplesTable={[]} studentExamplesTable={[]} /></Router>);
    expect(screen.getByText(/Simple Quiz/i)).toBeInTheDocument();
  });

  test('renders AudioQuiz component correctly', () => {
    render(<Router><AudioQuiz activeStudent={{}} programTable={[]} studentExamplesTable={[]} updateBannerMessage={() => { }} audioExamplesTable={[]} filterExamplesByAllowedVocab={() => { }} selectedLesson={{}} selectedProgram={{}} updateSelectedLesson={() => { }} updateSelectedProgram={() => { }} /></Router>);
    expect(screen.getByText(/Audio Quiz/i)).toBeInTheDocument();
  });

  test('LoginButton renders and functions correctly', () => {
    render(<LoginButton />);
    const button = screen.getByText(/Log In/i);
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(mockAuth0().loginWithRedirect).toHaveBeenCalled();
  });

  test('LogoutButton renders and functions correctly', () => {
    mockAuth0.mockReturnValueOnce({
      isAuthenticated: true,
      user: { name: 'Test User' },
      loading: false,
      loginWithRedirect: vi.fn(),
      logout: vi.fn(),
      getAccessTokenSilently: vi.fn(),
    });
    render(<LogoutButton />);
    const button = screen.getByText(/Log Out/i);
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(mockAuth0().logout).toHaveBeenCalled();
  });

  test('navigation links work correctly', () => {
    render(<Router><App /></Router>);
    const homeLink = screen.getByText(/Home/i);
    fireEvent.click(homeLink);
    expect(screen.getByText(/Welcome back!/i)).toBeInTheDocument();
  });

  test('state updates correctly when updateSelectedLesson is called', () => {
    const { container } = render(<Router><App /></Router>);
    const appInstance = container.firstChild._owner.stateNode;
    appInstance.updateSelectedLesson(1);
    expect(appInstance.state.selectedLesson).toEqual(expect.objectContaining({ recordId: 1 }));
  });

  test('handles API call correctly', async () => {
    mockAuth0.mockReturnValueOnce({
      isAuthenticated: true,
      user: { name: 'Test User' },
      loading: false,
      loginWithRedirect: vi.fn(),
      logout: vi.fn(),
      getAccessTokenSilently: vi.fn().mockResolvedValue('fakeToken'),
    });

    const mockGetUserDataFromBackend = vi.fn().mockResolvedValue([{ name: 'Test User' }]);
    render(<Router><App /></Router>);
    await expect(mockGetUserDataFromBackend()).resolves.toEqual([{ name: 'Test User' }]);
  });

  test('closeContextualIfClickOut works correctly', () => {
    const { container } = render(<Router><App /></Router>);
    const appInstance = container.firstChild._owner.stateNode;
    const mockEvent = { clientX: 0, clientY: 0 };
    appInstance.closeContextualIfClickOut(mockEvent);
  })
});