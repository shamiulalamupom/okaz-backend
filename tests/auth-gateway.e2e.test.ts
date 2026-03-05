import { beforeAll, describe, expect, it } from 'vitest';

const baseUrl = process.env.TEST_GATEWAY_URL ?? 'http://localhost:4000';
const adminEmail = process.env.ADMIN_SEED_EMAIL ?? 'admin@example.com';
const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? 'Admin1234!';

const uniqueEmail = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

const waitForReady = async () => {
  const maxAttempts = 60;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/ready`);
      if (response.ok) {
        return;
      }
    } catch {
      // ignored
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Gateway is not ready at ${baseUrl}/ready`);
};

const register = async (email: string, password: string) => {
  return fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
};

const login = async (email: string, password: string) => {
  return fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
};

beforeAll(async () => {
  await waitForReady();
});

describe('auth + gateway e2e', () => {
  it('register + login success', async () => {
    const email = uniqueEmail('register-login-success');
    const password = 'Password123';

    const registerResponse = await register(email, password);
    expect(registerResponse.status).toBe(201);

    const registerBody = (await registerResponse.json()) as {
      email: string;
      id: string;
      roles: string[];
    };
    expect(registerBody.email).toBe(email.toLowerCase());
    expect(registerBody.roles).toEqual(['CUSTOMER']);

    const loginResponse = await login(email, password);
    expect(loginResponse.status).toBe(200);

    const loginBody = (await loginResponse.json()) as {
      accessToken: string;
      user: {
        email: string;
        id: string;
        roles: string[];
      };
    };

    expect(loginBody.accessToken).toBeTypeOf('string');
    expect(loginBody.user.email).toBe(email.toLowerCase());
    expect(loginBody.user.roles).toEqual(['CUSTOMER']);
  });

  it('login failure with wrong password returns 401 + generic message', async () => {
    const email = uniqueEmail('login-fail');
    const password = 'Password123';

    const registerResponse = await register(email, password);
    expect(registerResponse.status).toBe(201);

    const loginResponse = await login(email, 'WrongPass123');
    expect(loginResponse.status).toBe(401);

    const body = (await loginResponse.json()) as { message: string };
    expect(body).toEqual({ message: 'Invalid credentials' });
  });

  it('gateway protected route returns 401 without token', async () => {
    const response = await fetch(`${baseUrl}/protected`);
    expect(response.status).toBe(401);
  });

  it('gateway protected route returns 200 with token', async () => {
    const email = uniqueEmail('protected-ok');
    const password = 'Password123';

    const registerResponse = await register(email, password);
    expect(registerResponse.status).toBe(201);

    const loginResponse = await login(email, password);
    expect(loginResponse.status).toBe(200);

    const loginBody = (await loginResponse.json()) as { accessToken: string };

    const protectedResponse = await fetch(`${baseUrl}/protected`, {
      headers: {
        Authorization: `Bearer ${loginBody.accessToken}`
      }
    });

    expect(protectedResponse.status).toBe(200);
  });

  it('/admin returns 403 for non-admin token, 200 for admin token', async () => {
    const email = uniqueEmail('non-admin');
    const password = 'Password123';

    const registerResponse = await register(email, password);
    expect(registerResponse.status).toBe(201);

    const nonAdminLoginResponse = await login(email, password);
    expect(nonAdminLoginResponse.status).toBe(200);
    const nonAdminLoginBody = (await nonAdminLoginResponse.json()) as { accessToken: string };

    const nonAdminResponse = await fetch(`${baseUrl}/admin`, {
      headers: {
        Authorization: `Bearer ${nonAdminLoginBody.accessToken}`
      }
    });
    expect(nonAdminResponse.status).toBe(403);

    const adminLoginResponse = await login(adminEmail, adminPassword);
    expect(adminLoginResponse.status).toBe(200);
    const adminLoginBody = (await adminLoginResponse.json()) as { accessToken: string };

    const adminResponse = await fetch(`${baseUrl}/admin`, {
      headers: {
        Authorization: `Bearer ${adminLoginBody.accessToken}`
      }
    });

    expect(adminResponse.status).toBe(200);
  });
});
