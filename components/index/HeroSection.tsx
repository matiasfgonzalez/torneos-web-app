"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const HeroSection = () => {
    return (
        <motion.section
            initial={{
                background: "linear-gradient(to right, #1d4ed8, #3b82f6)"
            }}
            animate={{
                background: [
                    "linear-gradient(to right, #1d4ed8, #3b82f6)",
                    "linear-gradient(to right, #9333ea, #3b82f6)",
                    "linear-gradient(to right, #1d4ed8, #3b82f6)"
                ]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="text-primary-foreground py-20"
        >
            <div className="container mx-auto px-4 text-center">
                <motion.h1
                    className="text-4xl md:text-6xl font-bold mb-6"
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    La Casa del Fútbol Local
                </motion.h1>
                <motion.p
                    className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    Sigue todos los torneos, resultados, estadísticas y noticias
                    del fútbol de tu región en tiempo real.
                </motion.p>
                <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <Button size="lg" variant="secondary" asChild>
                        <Link href="/torneos">Ver Torneos Activos</Link>
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
                        asChild
                    >
                        <Link href="/noticias">Últimas Noticias</Link>
                    </Button>
                </motion.div>
            </div>
        </motion.section>
    );
};

export default HeroSection;
