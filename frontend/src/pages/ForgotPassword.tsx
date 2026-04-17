import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Compass, Loader2, Mail, Lock, ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'email' | 'otp' | 'password' | 'done';

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verificationToken, setVerificationToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  // ── Step 1: send OTP ──────────────────────────────────────────────────────

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email'); return; }
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email);
      setStep('otp');
      setResendCooldown(60);
      toast({ title: 'Code sent!', description: `Check ${email} for your reset code.` });
    } catch (err: any) {
      setError(err.response?.data?.message || 'No account found for this email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 2: verify OTP ────────────────────────────────────────────────────

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) { setOtp(pasted.split('')); otpRefs.current[5]?.focus(); }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const code = otp.join('');
    if (code.length !== 6) { setError('Enter the 6-digit code'); return; }
    setIsSubmitting(true);
    try {
      const res = await authService.verifyEmail(email, code, 'forgot_password');
      setVerificationToken(res.verificationToken);
      setStep('password');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Incorrect or expired code. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await authService.forgotPassword(email);
      setOtp(['', '', '', '', '', '']);
      setResendCooldown(60);
      toast({ title: 'Code resent!', description: `New code sent to ${email}.` });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to resend', description: 'Please try again.' });
    }
  };

  // ── Step 3: new password ──────────────────────────────────────────────────

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setIsSubmitting(true);
    try {
      await authService.resetPassword(email, verificationToken, newPassword);
      setStep('done');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Compass className="h-7 w-7" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">TripWise</span>
          </Link>
        </div>

        <Card className="border-border shadow-tripwise">
          <AnimatePresence mode="wait">

            {/* ── Email ── */}
            {step === 'email' && (
              <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <CardHeader className="space-y-1 text-center">
                  <CardTitle className="font-display text-2xl">Forgot password?</CardTitle>
                  <CardDescription>Enter your email and we'll send a reset code</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={`pl-10 ${error ? 'border-destructive' : ''}`} autoFocus />
                      </div>
                      {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : 'Send Reset Code'}
                    </Button>
                  </form>
                </CardContent>
              </motion.div>
            )}

            {/* ── OTP ── */}
            {step === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <CardHeader className="space-y-1 text-center">
                  <CardTitle className="font-display text-2xl">Enter reset code</CardTitle>
                  <CardDescription>We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span></CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleOtpSubmit} className="space-y-6">
                    <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <Input key={i} ref={(el) => { otpRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)} className="h-12 w-12 text-center text-lg font-semibold" />
                      ))}
                    </div>
                    {error && <p className="text-center text-sm text-destructive">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : 'Verify Code'}
                    </Button>
                  </form>
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    Didn't receive it?{' '}
                    <button type="button" onClick={handleResend} disabled={resendCooldown > 0} className="text-primary hover:underline disabled:text-muted-foreground">
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                    </button>
                  </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <button type="button" onClick={() => setStep('email')} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-1 h-4 w-4" /> Change email
                  </button>
                </CardFooter>
              </motion.div>
            )}

            {/* ── New password ── */}
            {step === 'password' && (
              <motion.div key="password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <CardHeader className="space-y-1 text-center">
                  <CardTitle className="font-display text-2xl">New password</CardTitle>
                  <CardDescription>Choose a strong password for your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="newPassword" type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-10 pr-10" autoFocus />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10" />
                      </div>
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resetting...</> : 'Reset Password'}
                    </Button>
                  </form>
                </CardContent>
              </motion.div>
            )}

            {/* ── Done ── */}
            {step === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <CardHeader className="space-y-1 text-center">
                  <CardTitle className="font-display text-2xl">Password reset!</CardTitle>
                  <CardDescription>You can now sign in with your new password</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <Button className="w-full" onClick={() => navigate('/login')}>Go to Login</Button>
                </CardContent>
              </motion.div>
            )}

          </AnimatePresence>

          <CardFooter className="flex justify-center">
            <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
