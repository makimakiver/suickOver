import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import classNames from "classnames";
const ListItem = ({title, description, ref}: {title: string, description: string, ref: React.RefObject<HTMLAnchorElement>}) => {
    return (
		<li>
			<NavigationMenu.Link asChild>
				<a
					className={classNames("ListItemLink")}
					ref={ref}
				>
					<div className="ListItemHeading">{title}</div>
					<p className="ListItemText">{description}</p>
				</a>
			</NavigationMenu.Link>
		</li>
    )
}

export default ListItem