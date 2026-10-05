export type AppAction = {
  type?: string;
  // Reducer generik meneruskan payload apa adanya, sehingga bentuknya sengaja
  // dibiarkan longgar agar setiap slice dapat memakai tipe state-nya sendiri.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
};
