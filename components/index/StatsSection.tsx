"use client";

import { motion } from "framer-motion";

const StatsSection = () => {
    return (
        <section className="py-16 bg-muted/50">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { label: "Torneos Activos", value: 15 },
                        { label: "Equipos Registrados", value: 248 },
                        { label: "Partidos Jugados", value: 1247 },
                        { label: "Goles Anotados", value: 3891 }
                    ].map((item, i) => (
                        <motion.div
                            key={item.label}
                            className="text-center"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.2 }}
                        >
                            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                                {item.value.toLocaleString()}
                            </div>
                            <div className="text-muted-foreground">
                                {item.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
