export default function Avatar({ src, alt, size = 40 }: { src?: string; alt?: string; size?: number }) {
  return src ? (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover border border-gray-200 dark:border-gray-700"
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className="rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold border border-gray-200 dark:border-gray-700"
      style={{ width: size, height: size }}
    >
      {alt ? alt[0].toUpperCase() : '?'}
    </div>
  );
}
