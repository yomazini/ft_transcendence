interface AuthHeaderProps {
  title: string;
  description: string;
}

export function AuthHeader({
  title,
  description,
}: AuthHeaderProps) {
  return (
    <div className="mb-8 text-center">

      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
        {title}
      </h1>

      <p className="mt-3 text-base leading-7 text-muted-foreground">
        {description}
      </p>

    </div>
  );
}