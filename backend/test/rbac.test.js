const test = require('node:test');
const assert = require('node:assert');
const { requirePermission, requireStaff } = require('../src/middleware/rbacMiddleware');
const { ROLES, PERMISSIONS } = require('../src/constants');

test('RBAC: Super Admin bypasses all granular permission checks', () => {
  const req = {
    user: {
      _id: '123',
      role: ROLES.SUPER_ADMIN,
      permissions: [],
    },
  };
  const res = {};
  let nextCalled = false;

  const middleware = requirePermission(PERMISSIONS.MODERATION_REVIEW);
  middleware(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, true, 'Super Admin must always be allowed');
});

test('RBAC: Staff with matching granular permission is allowed', () => {
  const req = {
    user: {
      _id: '456',
      role: ROLES.MODERATOR,
      permissions: [PERMISSIONS.MODERATION_VIEW, PERMISSIONS.MODERATION_REVIEW],
    },
  };
  const res = {};
  let nextCalled = false;

  const middleware = requirePermission(PERMISSIONS.MODERATION_REVIEW);
  middleware(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, true, 'User with matching permission should pass');
});

test('RBAC: Staff lacking required permission receives 403 Forbidden', () => {
  const req = {
    user: {
      _id: '789',
      role: ROLES.CONTENT_EDITOR,
      permissions: [PERMISSIONS.CONTENT_VIEW],
    },
  };
  let errorStatus = null;
  let errorCode = null;

  const res = {
    status: (code) => {
      errorStatus = code;
      return {
        json: (data) => {
          errorCode = data.code;
        },
      };
    },
  };

  const middleware = requirePermission(PERMISSIONS.SETTINGS_MANAGE);
  middleware(req, res, () => {});

  assert.strictEqual(errorStatus, 403, 'Unauthorized role should return 403');
  assert.strictEqual(errorCode, 'FORBIDDEN', 'Error code should be FORBIDDEN');
});

test('RBAC: Staff check validates isStaff flag correctly', () => {
  const customEmployee = {
    user: {
      _id: '999',
      role: 'CUSTOM_ROLE',
      isStaff: true,
    },
  };
  let nextCalled = false;

  requireStaff(customEmployee, {}, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, true, 'isStaff flag must qualify user as staff');
});

