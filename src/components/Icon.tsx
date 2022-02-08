import React, {FC} from 'react';
import cs from 'classnames';
const  importAll = (requireContext: __WebpackModuleApi.RequireContext) => requireContext.keys().forEach(requireContext);
try {
    importAll(require.context('../assets/icons', true, /\.svg$/))
} catch (e) {
    console.log(e)
}

type Props = {
    name?: string
} & React.SVGAttributes<SVGElement>

const Icon:FC<Props> = (props) => {
    const {name,className,...rest} = props
    return (
        <svg className={cs("icon",className)} {...rest}>
            {name && <use xlinkHref={'#' + name}/>}
        </svg>
    );
};
export default Icon;