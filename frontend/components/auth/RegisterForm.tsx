"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input, Select } from "@/components/common/FormElements";
import { Error } from "@/components/common/Loading";
import { validateEmail, validatePassword, validateName } from "@/utils/validators";
import Link from "next/link";

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!validateName(name)) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!validateEmail(email)) {
      errors.email = "Invalid email address";
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.errors[0];
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();

    if (!validate()) return;

    try {
      await register(name, email, password, role);
      router.push("/dashboard");
    } catch (error) {
      // Error is handled by store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TeenVerse</h1>
          <p className="text-gray-600">Create your account</p>
        </div>

        {error && <Error message={error} onDismiss={clearError} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            error={validationErrors.name}
            required
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            error={validationErrors.email}
            required
          />

          <Select
            label="Register As"
            options={[
              { value: "user", label: "User (View Activity Only)" },
              { value: "admin", label: "Admin (Full Access)" },
            ]}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            error={validationErrors.password}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            error={validationErrors.confirmPassword}
            required
          />

          <Button type="submit" isLoading={isLoading} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
};
