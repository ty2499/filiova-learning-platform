import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PhoneNumberInput from "@/components/PhoneNumberInput";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import TeacherLogin from "./TeacherLogin";

const basicSignupSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  displayName: z.string().min(2, "Display name is required"),
  email: z.string().email("Valid email is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  country: z.string().min(1, "Country is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type BasicSignupForm = z.infer<typeof basicSignupSchema>;

type AuthView = 'signup' | 'login';

export default function TeacherSignupBasic() {
  const [currentView, setCurrentView] = useState<AuthView>('signup');
  const [verificationSent, setVerificationSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: countries } = useQuery<Array<{id: number, name: string}>>({
    queryKey: ['/api/countries'],
  });

  const form = useForm<BasicSignupForm>({
    resolver: zodResolver(basicSignupSchema),
    defaultValues: {
      fullName: "",
      displayName: "",
      email: "",
      phoneNumber: "",
      country: "",
      password: "",
      confirmPassword: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: BasicSignupForm) => {
      const response = await fetch("/api/teacher-applications/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          displayName: data.displayName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          country: data.country,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to initiate application");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUserEmail(data.email);
      setVerificationSent(true);
      setErrorMessage("");
    },
    onError: (error: Error) => {
      setErrorMessage(error.message);
    },
  });

  const onSubmit = (data: BasicSignupForm) => {
    submitMutation.mutate(data);
  };

  const handleResendLink = async () => {
    setIsResending(true);
    setErrorMessage("");
    setResendSuccess(false);
    try {
      const response = await fetch("/api/teacher-applications/resend-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend verification link");
      }

      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsResending(false);
    }
  };

  // Switch to login view if requested
  if (currentView === 'login') {
    return <TeacherLogin onNavigate={(page) => {
      if (page === 'signup') setCurrentView('signup');
    }} />;
  }

  if (verificationSent) {
    return (
      <div className="min-h-screen py-8 px-6">
        <div className="w-full mx-auto">
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardHeader className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#fff5f2' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" style={{ color: '#ff5834' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <CardTitle>Check Your Email</CardTitle>
              <CardDescription>
                We've sent a verification link to<br />
                <strong className="text-foreground">{userEmail}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {errorMessage}
                </div>
              )}
              {resendSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  A new verification link has been sent to your email.
                </div>
              )}
              
              <div className="rounded-lg p-4" style={{ backgroundColor: '#ffffff', borderWidth: '1px', borderStyle: 'solid', borderColor: '#cccccc' }}>
                <div className="flex items-start gap-3 text-left">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#000000' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm" style={{ color: '#000000' }}>
                    <p className="font-medium mb-1">Click the link in your email to verify your account</p>
                    <p className="text-xs" style={{ color: '#000000' }}>The link will expire in 24 hours</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-semibold mb-1">Didn't receive the email?</p>
                    <p className="text-xs">Check your spam folder or contact support at support@edufiliova.com</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleResendLink}
                variant="outline"
                className="w-full"
                disabled={isResending}
                data-testid="button-resend-link"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend Verification Link"
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={() => setVerificationSent(false)}
                className="w-full"
                data-testid="button-back"
              >
                Back to Signup Form
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="w-full mx-auto">
        <div className="mb-8">
          <h1 className="font-bold text-foreground mb-2 text-[20px] text-center">Apply as a Teacher on EduFiliova</h1>
        </div>

        <Card>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {errorMessage}
                </div>
              )}
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="e.g. Purity Johns"
                  data-testid="input-full-name"
                  {...form.register("fullName")}
                />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.fullName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="displayName">Display Name (Shown to Students) *</Label>
                <Input
                  id="displayName"
                  placeholder="e.g. Mrs. P Johns"
                  data-testid="input-display-name"
                  {...form.register("displayName")}
                />
                {form.formState.errors.displayName && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.displayName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. teacher@example.com"
                  data-testid="input-email"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <PhoneNumberInput
                  value={form.watch("phoneNumber") || ""}
                  onChange={(value) => form.setValue("phoneNumber", value)}
                  data-testid="input-phone"
                />
                {form.formState.errors.phoneNumber && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.phoneNumber.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="country">Country of Residence *</Label>
                <Select
                  value={form.watch("country")}
                  onValueChange={(value) => form.setValue("country", value)}
                >
                  <SelectTrigger data-testid="select-country">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries?.map((country) => (
                      <SelectItem key={country.id} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.country && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.country.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    data-testid="input-password"
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    data-testid="input-confirm-password"
                    {...form.register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    data-testid="button-toggle-confirm-password"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-[#c5f13c] hover:bg-[#b5e02c] text-black font-semibold"
                disabled={submitMutation.isPending}
                data-testid="button-submit"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center mt-4">
                Already have an account?{" "}
                <button 
                  type="button"
                  onClick={() => setCurrentView('login')} 
                  className="text-primary hover:underline font-medium"
                >
                  Sign in here
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
