type Props = {
  data: any[];
};

export default function SMIStats({
  data,
}: Props) {
  const registered =
    data.length;

  const available =
    data.filter(
      (x) =>
        x.status === "AVAILABLE"
    ).length;

  const issued =
    data.filter(
      (x) =>
        x.status === "ISSUED"
    ).length;

  const liquidated =
    data.filter(
      (x) =>
        x.status ===
        "LIQUIDATED"
    ).length;

  const cards = [
    {
      title: "Registered",
      value: registered,
      color:
        "bg-gradient-to-r from-blue-500 to-blue-600",
    },
    {
      title: "Available",
      value: available,
      color:
        "bg-gradient-to-r from-green-500 to-green-600",
    },
    {
      title: "Issued",
      value: issued,
      color:
        "bg-gradient-to-r from-orange-500 to-orange-600",
    },
    {
      title: "Liquidated",
      value: liquidated,
      color:
        "bg-gradient-to-r from-purple-500 to-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`${card.color} rounded-2xl p-6 text-white shadow`}
        >
          <p className="text-sm opacity-90">
            {card.title}
          </p>

          <h2 className="mt-3 text-4xl font-bold">
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}