import React, { useEffect } from "react";
import { BarChart3Icon, GlobeIcon, HeartHandshakeIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

const features = [
  {
    name: "Data-Driven Insights",
    description:
      "Leverage advanced analytics to estimate economic losses in conflict regions. Our platform uses open data APIs to provide accurate assessments of financial impact on displaced populations.",
    href: "#",
    icon: BarChart3Icon,
  },
  {
    name: "Interactive Mapping",
    description:
      "Visualize economic impact with our color-coded global map. Zoom into specific regions to see detailed statistics and identify areas with the most urgent humanitarian needs.",
    href: "#",
    icon: GlobeIcon,
  },
  {
    name: "Transparent Aid Allocation",
    description:
      "Track donations and see their impact in real-time. Our platform enables donors to contribute money, food, supplies, and volunteer resources with complete transparency.",
    href: "#",
    icon: HeartHandshakeIcon,
  },
];

export function FeaturesSection() {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section id="features" className="container py-24 px-4">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={headerVariants}
        className="mx-auto max-w-2xl text-center"
      >
        <h3 className="text-sm font-semibold bg-gradient-to-r from-primary via-accent to-[var(--chart-5)] bg-clip-text text-transparent">Humanitarian Impact</h3>
        <h2 className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Driving Efficient Aid Through Data
        </h2>
        <p className="mt-6 text-lg text-muted-foreground">
          Live Aid provides powerful tools to analyze, visualize, and optimize humanitarian aid for displaced populations in conflict regions around the world.
        </p>
      </motion.div>

      <motion.div 
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={containerVariants}
        className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mt-24 lg:max-w-none lg:grid-cols-3"
      >
        {features.map((feature) => (
          <motion.div key={feature.name} variants={itemVariants}>
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="p-0">
                <div className="flex items-center gap-x-3">
                  <feature.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {feature.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="mt-4 p-0">
                <p className="text-muted-foreground">{feature.description}</p>
                <div className="mt-6">
                  <Button variant="link" className="p-0 text-accent hover:text-primary" asChild>
                    <a href={feature.href}>
                      Learn more <span aria-hidden="true">→</span>
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}