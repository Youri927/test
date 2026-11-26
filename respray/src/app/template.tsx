/* Chaque page arrive en glissant légèrement (0,4 s) : on voit qu'on a changé de page, sans attendre — le contenu
   est visible dès la première image (il part de 40 % d'opacité, pas de zéro). */
export default function Gabarit({children}: {children: React.ReactNode}) {
  return <div className="entree">{children}</div>;
}
