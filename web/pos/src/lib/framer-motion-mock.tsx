import React from 'react';

export const AnimatePresence = ({ children, ...props }: any) => <>{children}</>;

// Strip out framer-motion specific props that cause hydration errors
const stripMotionProps = (props: any) => {
    const {
        whileHover,
        whileTap,
        whileDrag,
        whileFocus,
        whileInView,
        initial,
        animate,
        exit,
        transition,
        variants,
        layout,
        layoutId,
        drag,
        dragConstraints,
        dragElastic,
        dragMomentum,
        onDragStart,
        onDrag,
        onDragEnd,
        ...rest
    } = props;
    return rest;
};

const MotionDiv = React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div ref={ref} {...stripMotionProps(props)}>{children}</div>
));
MotionDiv.displayName = 'MotionDiv';

const MotionButton = React.forwardRef(({ children, ...props }: any, ref: any) => (
    <button ref={ref} {...stripMotionProps(props)}>{children}</button>
));
MotionButton.displayName = 'MotionButton';

export const motion = {
    div: MotionDiv,
    button: MotionButton,
    span: MotionDiv,
    section: MotionDiv,
    p: MotionDiv,
    h1: MotionDiv,
    h2: MotionDiv,
    h3: MotionDiv,
    h4: MotionDiv,
    h5: MotionDiv,
    h6: MotionDiv,
    img: ({ ...props }: any) => <img {...stripMotionProps(props)} />,
    a: ({ children, ...props }: any) => <a {...stripMotionProps(props)}>{children}</a>,
    main: MotionDiv,
    nav: MotionDiv,
    header: MotionDiv,
    footer: MotionDiv,
    aside: MotionDiv,
    svg: ({ children, ...props }: any) => <svg {...stripMotionProps(props)}>{children}</svg>,
    path: ({ ...props }: any) => <path {...stripMotionProps(props)} />,
    circle: ({ ...props }: any) => <circle {...stripMotionProps(props)} />,
    ul: MotionDiv,
    li: MotionDiv,
    table: MotionDiv,
    tr: MotionDiv,
    td: MotionDiv,
    th: MotionDiv,
    tbody: MotionDiv,
    thead: MotionDiv,
};
