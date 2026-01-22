import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Compass, MapPin, Wallet, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: MapPin,
      title: 'Plan Any Destination',
      description: 'Organize trips to 40+ countries with seasonal insights and local tips.',
    },
    {
      icon: Wallet,
      title: 'Track Your Budget',
      description: 'Set budgets, record expenses, and see spending by category in real-time.',
    },
    {
      icon: Calendar,
      title: 'Stay on Schedule',
      description: 'Manage trip dates and never miss your next adventure.',
    },
  ];

  const benefits = [
    'Multi-currency support',
    'Expense categorization',
    'Budget progress tracking',
    'Seasonal travel planning',
    'Mobile-friendly design',
    'Export reports (coming soon)',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Compass className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-bold">TripWise</span>
            </Link>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link to="/trips">
                  <Button>Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            Plan Smarter.{' '}
            <span className="text-primary">Travel Better.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            TripWise helps you organize your trips, track expenses, and stay on budget
            — so you can focus on making memories.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={isAuthenticated ? '/trips' : '/register'}>
              <Button size="lg" className="text-base px-8">
                Start Planning Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="text-base px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl font-bold text-foreground">
            Everything You Need to Travel Smart
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Simple tools to plan, track, and manage your travel expenses
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-8 rounded-2xl bg-card border border-border hover:shadow-tripwise transition-shadow"
            >
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5">
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold text-foreground">
              Why Choose TripWise?
            </h2>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex items-center gap-3 p-4 rounded-lg bg-muted/50"
              >
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                <span className="font-medium">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Ready to Plan Your Next Adventure?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join TripWise today and take control of your travel budget.
          </p>
          <Link to={isAuthenticated ? '/trips' : '/register'}>
            <Button size="lg" className="text-base px-10">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              <span className="font-display font-semibold">TripWise</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TripWise. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
