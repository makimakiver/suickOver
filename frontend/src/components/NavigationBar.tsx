import React from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import classNames from "classnames";
import { CaretDownIcon } from "@radix-ui/react-icons";
import "./Navigationbar.css";

const NavigationMenuDemo = () => {
	return (
		<NavigationMenu.Root className="NavigationMenuRoot">
			<NavigationMenu.List className="NavigationMenuList">
				<NavigationMenu.Item>
					<NavigationMenu.Trigger className="NavigationMenuTrigger">
						Learn <CaretDownIcon className="CaretDown" aria-hidden />
					</NavigationMenu.Trigger>
					<NavigationMenu.Content className="NavigationMenuContent">
						<ul className="List one">
							{/* <li style={{ gridRow: "span 3" }}> */}
								{/* <NavigationMenu.Link asChild>
                                    <div className="CalloutWrapper">
                                        <a className="Callout" href="/">
                                            <svg
                                                aria-hidden
                                                width="30"
                                                height="30"
                                                viewBox="0 0 40 10"
                                                fill="black"
                                            >
                                                <path d="M12 25C7.58173 25 4 21.4183 4 17C4 12.5817 7.58173 9 12 9V25Z"></path>
                                                <path d="M12 0H4V8H12V0Z"></path>
                                                <path d="M17 8C19.2091 8 21 6.20914 21 4C21 1.79086 19.2091 0 17 0C14.7909 0 13 1.79086 13 4C13 6.20914 14.7909 8 17 8Z"></path>
                                            </svg>
                                            <div className="CalloutHeading">Radix Primitives</div>
                                            <p className="CalloutText">
                                                Unstyled, accessible components for React.
                                            </p>
                                        </a>
                                    </div>
								</NavigationMenu.Link> */}
							{/* </li> */}

							<ListItem href="/post-question" title="Post your Question">
								CSS-in-JS with best-in-class developer experience.
							</ListItem>
							<ListItem href="/colors" title="Colors">
								Beautiful, thought-out palettes with auto dark mode.
							</ListItem>
							<ListItem href="https://icons.radix-ui.com/" title="Icons">
								A crisp set of 15x15 icons, balanced and consistent.
							</ListItem>
						</ul>
					</NavigationMenu.Content>
				</NavigationMenu.Item>
			</NavigationMenu.List>

			<div className="ViewportPosition">
				<NavigationMenu.Viewport className="NavigationMenuViewport" />
			</div>
		</NavigationMenu.Root>
	);
};

interface ListItemProps {
	className?: string;
	title: string;
	href: string;
	children: React.ReactNode;
}

const ListItem = React.forwardRef<HTMLAnchorElement, ListItemProps>(
	({ className, children, title, ...props }, forwardedRef) => (
		<li>
			<NavigationMenu.Link asChild>
				<a className={classNames("ListItemLink", className)} {...props} ref={forwardedRef}>
					<div className="ListItemHeading">{title}</div>
					<p className="ListItemText">{children}</p>
				</a>
			</NavigationMenu.Link>
		</li>
	)
);

export default NavigationMenuDemo;
