'use client';

export default function Stats() {
  const stats = [
    { value: '2.4M+', label: 'Videos Generated' },
    { value: '50K+', label: 'Active Users' },
    { value: '$2.8M', label: 'Total Volume' },
    { value: '99.9%', label: 'Uptime' },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="gradient-purple-blue rounded-xl p-6 md:p-8 text-center transform hover:scale-105 transition-transform"
            >
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-white/80">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

