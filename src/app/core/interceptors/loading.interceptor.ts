import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SpinnerService } from '../../shared/spinner/spinner.service';
import { finalize } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // Ignora requisições para assets
  if (req.url.includes('/assets/')) {
    return next(req);
  }

  const spinnerService = inject(SpinnerService);
  spinnerService.show();

  return next(req).pipe(
    finalize(() => {
      spinnerService.hide();
    })
  );
}; 