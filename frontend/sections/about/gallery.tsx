import Image from "next/image";

const gallery = [
  {
    image: "/images/gallery/architecture.jpg",
    title: "Designing the Architecture",
    description:
      "Planning the platform structure and defining how every service works together.",
    size: "large",
  },
  {
    image: "/images/gallery/coding.jpg",
    title: "Development Session",
    description:
      "Building new features and improving the user experience.",
    size: "small",
  },
  {
    image: "/images/gallery/brainstorming.jpg",
    title: "Brainstorming",
    description:
      "Discussing ideas, solving challenges, and exploring new possibilities.",
    size: "small",
  },
  {
    image: "/images/gallery/deployment.jpg",
    title: "Deployment Day",
    description:
      "Deploying containers and infrastructure to Kubernetes.",
    size: "large",
  },
  {
    image: "/images/gallery/testing.jpg",
    title: "Testing",
    description:
      "Validating every feature before it reaches users.",
    size: "small",
  },
  {
    image: "/images/gallery/presentation.jpg",
    title: "Project Presentation",
    description:
      "Sharing our progress, demonstrating features, and collecting feedback.",
    size: "large",
  },
];

export function GallerySection() {
  return (
    <section
      id="gallery"
      className="border-b py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">

          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Behind the Scenes
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Building More Than Software
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Every feature begins with an idea, grows through collaboration,
            and is refined through countless hours of development, testing,
            and learning together.
          </p>

        </div>

        {/* Gallery */}

        <div className="mt-20 grid gap-6 md:grid-cols-2">

          {gallery.map((item) => (
            <div
              key={item.title}
              className={item.size === "large" ? "md:col-span-2" : ""}
            >
              <div className="group overflow-hidden rounded-3xl border">

                <Image
                  src={item.image}
                  alt={item.title}
                  width={1600}
                  height={900}
                  className={`w-full object-cover transition duration-500 group-hover:scale-105 ${
                    item.size === "large"
                      ? "h-[500px]"
                      : "h-[320px]"
                  }`}
                />

                <div className="p-6">

                  <h3 className="text-2xl font-bold">
                    {item.title}
                  </h3>

                  <p className="mt-3 leading-7 text-muted-foreground">
                    {item.description}
                  </p>

                </div>

              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}