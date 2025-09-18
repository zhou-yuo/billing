export const scrollToId = (elementId: string) => {
  const element = document.querySelector(`#${elementId}`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

// 截取小驼峰命名字符串中的驼峰字母
export function getAcronymFromCamelCase(camelCaseString: string) {
  if (!camelCaseString || typeof camelCaseString !== 'string') {
    return '';
  }

  // 提取第一个字母
  const firstLetter = camelCaseString.charAt(0);

  // 使用正则表达式匹配字符串中所有的大写字母
  const otherUpperCaseLetters = camelCaseString.slice(1).match(/[A-Z]/g) || [];

  // 组合并转换为大写
  const acronym = firstLetter + otherUpperCaseLetters.join('');

  return acronym.toUpperCase();
}