import { UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy();
  });

  it('should validate and extract user payload', () => {
    const payload = { sub: 1, email: 'test@example.com', role: Role.PATRON };
    const result = strategy.validate(payload);

    expect(result).toEqual({
      id: 1,
      email: 'test@example.com',
      role: Role.PATRON,
    });
  });

  it('should throw UnauthorizedException when sub is missing', () => {
    expect(() =>
      strategy.validate({
        sub: undefined as unknown as number,
        email: 'test@example.com',
        role: Role.PATRON,
      }),
    ).toThrow(UnauthorizedException);
  });
});
