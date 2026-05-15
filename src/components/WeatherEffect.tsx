import { motion } from 'motion/react';
import { WeatherType } from '../types';

export function WeatherEffect({ type }: { type: WeatherType }) {
  if (type === 'Nắng') return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {type === 'Mưa' && (
        <div className="absolute inset-0 bg-blue-900/10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-[1px] h-8 bg-blue-400/30"
              initial={{ y: -100, x: Math.random() * 100 + '%' }}
              animate={{ y: 1000 }}
              transition={{ 
                duration: 0.5 + Math.random() * 0.5, 
                repeat: Infinity, 
                ease: "linear",
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      )}
      {type === 'Tuyết' && (
        <div className="absolute inset-0 bg-white/5">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full"
              initial={{ y: -20, x: Math.random() * 100 + '%' }}
              animate={{ y: 1000, x: (Math.random() * 100 + 10) + '%' }}
              transition={{ 
                duration: 3 + Math.random() * 3, 
                repeat: Infinity, 
                ease: "linear",
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>
      )}
      {type === 'Sương mù' && (
        <motion.div 
          className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {type === 'U ám' && (
        <div className="absolute inset-0 bg-black/30" />
      )}
      {type === 'Sấm sét' && (
        <div className="absolute inset-0">
          <motion.div 
            className="absolute inset-0 bg-white/20"
            animate={{ opacity: [0, 0, 1, 0, 1, 0, 0] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 + Math.random() * 5 }}
          />
        </div>
      )}
    </div>
  );
}
